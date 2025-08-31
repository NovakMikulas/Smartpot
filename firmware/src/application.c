#include <twr.h>
#include <twr_module_relay.h>

#define TEMP_INTERVAL_MS 30000
#define LIGHT_INTERVAL_MS 30000
#define WATER_INTERVAL_MS 30000
#define BATTERY_INTERVAL_MS (60 * 60 * 1000)
//#define BATTERY_INTERVAL_MS 10000
#define PUMP_ON_TIME_MS 5000

#define MODE_NORMAL_SOIL_INTERVAL 30000
#define MODE_FAST_WATERING_INTERVAL 5000
#define FAST_MODE_DURATION_MS 120000

uint32_t water_current_interval = WATER_INTERVAL_MS;
bool water_fast_mode = false;
twr_tick_t water_fast_mode_until = 0;

uint32_t soil_current_interval = MODE_NORMAL_SOIL_INTERVAL;
bool soil_fast_mode = false;
twr_tick_t soil_fast_mode_until = 0;

bool pump_on = false;
bool pump_active_mode = false;

float adc_values[3];
float soil_humidity_percent = 0;
float light_percent = 0;
float water_level_voltage = 0;
float temperature = NAN;
int countdown = 5;

#define ADC_CHANNEL_SOIL 0
#define ADC_CHANNEL_WATER 1
#define ADC_CHANNEL_LIGHT 2

twr_led_t led;
twr_button_t button;
twr_tmp112_t tmp112;
static twr_module_relay_t relay;
twr_scheduler_task_id_t pump_task_id;
twr_scheduler_task_id_t task_temp_id, task_soil_id, task_light_id, task_water_id;
twr_scheduler_task_id_t watering_soil_id, watering_water_id;
static twr_scheduler_task_id_t countdown_id = 0;
static twr_scheduler_task_id_t watering_stop_task_id = 0;

void countdown_task(void *param)
{
    if (countdown > 0)
    {
        char msg[32];
        snprintf(msg, sizeof(msg), "Pump ON - %ds remaining", countdown);
        twr_radio_pub_string("log", msg);
        countdown--;
        twr_scheduler_plan_current_relative(1000);
    }
}

void fast_mode_stop_task(void *param)
{
    soil_fast_mode = false;
    water_fast_mode = false;
    watering_stop_task_id = 0;
    twr_log_info("Rychlý režim ukončen");
    twr_radio_pub_string("log", "Zalévací režim ukončen");
}

void watering_control_callback(uint64_t *id, const char *topic, void *value, void *param)
{
    int state = *(int *)value;

    if (state == 1)
    {
        soil_fast_mode = true;
        soil_fast_mode_until = twr_tick_get() + FAST_MODE_DURATION_MS;
        twr_scheduler_plan_now(watering_soil_id);

        water_fast_mode = true;
        water_fast_mode_until = twr_tick_get() + FAST_MODE_DURATION_MS;
        twr_scheduler_plan_now(watering_water_id);

        twr_scheduler_plan_absolute(watering_stop_task_id, twr_tick_get() + FAST_MODE_DURATION_MS);
        twr_radio_pub_string("log", "Watering mode ON (fast sensor updates)");
    }
    else
    {
        soil_fast_mode = false;
        water_fast_mode = false;

        if (watering_stop_task_id != 0)
        {
            twr_scheduler_unregister(watering_stop_task_id);
            watering_stop_task_id = 0; // důležité pro další naplánování
        }

        twr_radio_pub_string("log", "Watering mode OFF");
    }
}


void radio_callback(uint64_t *id, const char *topic, void *value, void *param)
{
    twr_module_sensor_set_vdd(true);
    twr_adc_async_measure(TWR_ADC_CHANNEL_A5);
    twr_module_sensor_set_vdd(false);
    int state = *(int *)value;
    if (state == 1)
    {
        if (water_level_voltage <= 1.5f)
        {
            twr_radio_pub_string("log", "Pump NOT activated: Water LOW");
            return;
        }
        twr_module_relay_set_state(&relay, false);
        pump_on = true;
        pump_active_mode = true;
        twr_radio_pub_string("log", "Pump ON (from gateway)");
        twr_scheduler_plan_now(0);
        twr_scheduler_plan_relative(pump_task_id, PUMP_ON_TIME_MS);

        countdown = 5;
        if (countdown_id == 0)
        {
            countdown_id = twr_scheduler_register(countdown_task, NULL, TWR_TICK_INFINITY);
        }
        twr_scheduler_plan_now(countdown_id);
    }
    else
    {
        twr_module_relay_set_state(&relay, true);
        pump_on = false;
        pump_active_mode = false;
        twr_radio_pub_string("log", "Pump OFF (from gateway)");
    }
}

static const twr_radio_sub_t subs[] = {
    { "pump/-/set/state", TWR_RADIO_SUB_PT_INT, radio_callback, NULL },
    { "watering/-/set/state", TWR_RADIO_SUB_PT_INT, watering_control_callback, NULL }
};

void tmp112_event_handler(twr_tmp112_t *self, twr_tmp112_event_t event, void *event_param)
{
    if (event == TWR_TMP112_EVENT_UPDATE)
    {
        if (twr_tmp112_get_temperature_celsius(self, &temperature))
        {
            twr_radio_pub_float("sensor/temp", &temperature);
        }
    }
}

void battery_event_handler(twr_module_battery_event_t event, void *event_param)
{
    if (event == TWR_MODULE_BATTERY_EVENT_UPDATE)
    {
         int percent;
        if (twr_module_battery_get_charge_level(&percent))
        {
            float battery_percent = (float)percent;
            twr_radio_pub_float("sensor/battery", &battery_percent); // přidáme nový topic
        }
    }
}

void adc_event_handler(twr_adc_channel_t channel, twr_adc_event_t event, void *param)
{
    if (event == TWR_ADC_EVENT_DONE)
    {
        if (channel == TWR_ADC_CHANNEL_A4)
            twr_adc_async_get_voltage(channel, &adc_values[ADC_CHANNEL_SOIL]);
        else if (channel == TWR_ADC_CHANNEL_A5)
            twr_adc_async_get_voltage(channel, &adc_values[ADC_CHANNEL_WATER]);
        else if (channel == TWR_ADC_CHANNEL_A3)
            twr_adc_async_get_voltage(channel, &adc_values[ADC_CHANNEL_LIGHT]);
    }
}

void button_event_handler(twr_button_t *self, twr_button_event_t event, void *event_param)
{
    if (event == TWR_BUTTON_EVENT_CLICK && !pump_on)
    {
        if (water_level_voltage <= 1.5f)
        {
            twr_radio_pub_string("log", "Pump NOT activated (button): Water LOW");
            return;
        }
        twr_module_relay_set_state(&relay, false);
        pump_on = true;
        pump_active_mode = true;
        twr_radio_pub_string("log", "Pump ON (button)");
        twr_scheduler_plan_relative(pump_task_id, PUMP_ON_TIME_MS);

        countdown = 5;
        if (countdown_id == 0)
        {
            countdown_id = twr_scheduler_register(countdown_task, NULL, TWR_TICK_INFINITY);
        }
        twr_scheduler_plan_now(countdown_id);
    }
    else if (event == TWR_BUTTON_EVENT_HOLD)
    {
        // ✨ Spustit párování
        twr_radio_pairing_request("smart_pot_test", FW_VERSION);
        twr_radio_pub_string("log", "Pairing request sent (via button)");
        twr_log_info("Pairing request sent (via button)");
        twr_led_pulse(&led, 1000);
    }
}

void temp_task(void *param)
{
    twr_tmp112_measure(&tmp112);
    twr_scheduler_plan_current_relative(TEMP_INTERVAL_MS);
}

void soil_task(void *param)
{
    twr_module_sensor_set_vdd(true);
    twr_adc_async_measure(TWR_ADC_CHANNEL_A4);
    twr_module_sensor_set_vdd(false);

    float raw = adc_values[ADC_CHANNEL_SOIL];
    soil_humidity_percent = (1.0f - (raw - 1.0f) / (3.3f - 1.0f)) * 100.0f;
    soil_humidity_percent = soil_humidity_percent < 0 ? 0 : (soil_humidity_percent > 100 ? 100 : soil_humidity_percent);

    twr_radio_pub_float("sensor/soil", &soil_humidity_percent);

    twr_scheduler_plan_current_relative(soil_current_interval);
}

void watering_soil_task(void *param)
{
    if (!soil_fast_mode) return;

    twr_module_sensor_set_vdd(true);
    twr_adc_async_measure(TWR_ADC_CHANNEL_A4);
    twr_module_sensor_set_vdd(false);

    float raw = adc_values[ADC_CHANNEL_SOIL];
    float humidity = (1.0f - (raw - 1.0f) / (3.3f - 1.0f)) * 100.0f;
    humidity = humidity < 0 ? 0 : (humidity > 100 ? 100 : humidity);

    twr_radio_pub_float("sensor/soil/watering", &humidity);
    twr_scheduler_plan_current_relative(MODE_FAST_WATERING_INTERVAL);
}

void watering_water_task(void *param)
{
    if (!water_fast_mode) return;

    twr_module_sensor_set_vdd(true);
    twr_adc_async_measure(TWR_ADC_CHANNEL_A5);
    twr_module_sensor_set_vdd(false);

    float voltage = adc_values[ADC_CHANNEL_WATER];

    const char *status = "HIGH";
    if (voltage <= 1.5f) status = "LOW";
    else if (voltage <= 1.7f) status = "MEDIUM";

    twr_radio_pub_string("sensor/water/watering", status);
    twr_scheduler_plan_current_relative(MODE_FAST_WATERING_INTERVAL);
}

void light_task(void *param)
{
    twr_module_sensor_set_vdd(true);
    twr_adc_async_measure(TWR_ADC_CHANNEL_A3);
    twr_module_sensor_set_vdd(false);

    float voltage = adc_values[ADC_CHANNEL_LIGHT];
    light_percent = (1.0f - (voltage / 3.3f)) * 100.0f;
    light_percent = light_percent < 0 ? 0 : (light_percent > 100 ? 100 : light_percent);
    twr_radio_pub_float("sensor/light", &light_percent);

    twr_scheduler_plan_current_relative(LIGHT_INTERVAL_MS);
}

void water_task(void *param)
{
    twr_module_sensor_set_vdd(true);
    twr_adc_async_measure(TWR_ADC_CHANNEL_A5);
    twr_module_sensor_set_vdd(false);

    water_level_voltage = adc_values[ADC_CHANNEL_WATER];

    const char *status = "HIGH";
    if (water_level_voltage <= 1.5f) status = "LOW";
    else if (water_level_voltage <= 1.7f) status = "MEDIUM";

    twr_radio_pub_string("sensor/water", status);

    if (pump_on && strcmp(status, "LOW") == 0)
    {
        twr_log_info("Water LOW → auto pump OFF");
        pump_on = false;
        pump_active_mode = false;
        twr_module_relay_set_state(&relay, true);
        twr_radio_pub_string("log", "Pump OFF (auto: low water)");

        if (countdown_id != 0)
        {
            twr_scheduler_unregister(countdown_id);
            countdown_id = 0;
        }
    }

    twr_scheduler_plan_current_relative(water_current_interval);
}

void pump_task(void *param)
{
    twr_radio_pub_string("log", "Zalévací režim aktivní – rychlé posílání po dobu 2 minut");

    if (!pump_on) return;

    twr_module_relay_set_state(&relay, true);
    twr_radio_pub_string("log", "Pump OFF");

    soil_fast_mode = true;
    soil_fast_mode_until = twr_tick_get() + FAST_MODE_DURATION_MS;
    twr_scheduler_plan_now(watering_soil_id);

    water_fast_mode = true;
    water_fast_mode_until = twr_tick_get() + FAST_MODE_DURATION_MS;
    twr_scheduler_plan_now(watering_water_id);

    twr_log_info("Zalévací režim aktivní – rychlé posílání po dobu 2 minut");

    if (watering_stop_task_id != 0)
    {
        twr_scheduler_unregister(watering_stop_task_id);
    }

    watering_stop_task_id = twr_scheduler_register(fast_mode_stop_task, NULL, twr_tick_get() + FAST_MODE_DURATION_MS);

    twr_scheduler_plan_relative(pump_task_id, PUMP_ON_TIME_MS);

    pump_on = false;
    pump_active_mode = false;
    twr_module_relay_set_state(&relay, true);
}

void application_init(void)
{
    twr_log_init(TWR_LOG_LEVEL_DUMP, TWR_LOG_TIMESTAMP_ABS);

    twr_led_init(&led, TWR_GPIO_LED, false, false);
    twr_button_init(&button, TWR_GPIO_BUTTON, TWR_GPIO_PULL_DOWN, false);
    twr_button_set_event_handler(&button, button_event_handler, NULL);
    twr_button_set_hold_time(&button, 5000);

    twr_module_battery_init();
    twr_module_battery_set_event_handler(battery_event_handler, NULL);
    twr_module_battery_set_update_interval(BATTERY_INTERVAL_MS);

    twr_tmp112_init(&tmp112, TWR_I2C_I2C0, 0x49);
    twr_tmp112_set_event_handler(&tmp112, tmp112_event_handler, NULL);
    twr_tmp112_set_update_interval(&tmp112, TWR_TICK_INFINITY);

    twr_module_sensor_init();
    twr_adc_init();
    twr_adc_set_event_handler(TWR_ADC_CHANNEL_A4, adc_event_handler, NULL);
    twr_adc_set_event_handler(TWR_ADC_CHANNEL_A5, adc_event_handler, NULL);
    twr_adc_set_event_handler(TWR_ADC_CHANNEL_A3, adc_event_handler, NULL);
    twr_adc_resolution_set(TWR_ADC_CHANNEL_A4, TWR_ADC_RESOLUTION_12_BIT);
    twr_adc_resolution_set(TWR_ADC_CHANNEL_A5, TWR_ADC_RESOLUTION_12_BIT);
    twr_adc_resolution_set(TWR_ADC_CHANNEL_A3, TWR_ADC_RESOLUTION_12_BIT);

    twr_radio_init(TWR_RADIO_MODE_NODE_SLEEPING);
    twr_radio_set_rx_timeout_for_sleeping_node(2000);
    twr_radio_set_subs((twr_radio_sub_t *)subs, sizeof(subs) / sizeof(subs[0]));

    twr_module_relay_init(&relay, TWR_MODULE_RELAY_I2C_ADDRESS_DEFAULT);

    task_temp_id = twr_scheduler_register(temp_task, NULL, 1000);
    task_soil_id = twr_scheduler_register(soil_task, NULL, 2000);
    task_light_id = twr_scheduler_register(light_task, NULL, 3000);
    task_water_id = twr_scheduler_register(water_task, NULL, 4000);
    watering_soil_id = twr_scheduler_register(watering_soil_task, NULL, TWR_TICK_INFINITY);
    watering_water_id = twr_scheduler_register(watering_water_task, NULL, TWR_TICK_INFINITY);
    pump_task_id = twr_scheduler_register(pump_task, NULL, TWR_TICK_INFINITY);
    watering_stop_task_id = twr_scheduler_register(fast_mode_stop_task, NULL, TWR_TICK_INFINITY);

    twr_led_pulse(&led, 1000);
}