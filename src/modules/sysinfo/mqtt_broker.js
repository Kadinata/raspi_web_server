//===========================================================================
//  
//===========================================================================
const mqtt = require('mqtt');
const { EventEmitter } = require('events');
const { once } = require('../../utils/event_utils');

const LOOPBACK_TOPIC = "test/loopback";
const LOOPBACK_MESSAGE = "loopback status";
const MQTT_HOST = "mqtt://localhost";

let mqtt_client = null;

const statusListener = new EventEmitter();

/**
 * Initializes an MQTT client and sets up event listener.
 * Does nothing if the client has been initialized.
 * @param {string} host - Address of the MQTT broker
 */
const init_client = async (host = MQTT_HOST) => {
  if (mqtt_client) return Promise.resolve();

  mqtt_client = mqtt.connect(host);
  mqtt_client.on('offline', () => {
    console.log('MQTT Broker went offline.');
    statusListener.emit('statusChange', { online: false });
  });

  mqtt_client.on('connect', () => {
    console.log('MQTT Broker connected.');
    mqtt_client.subscribe(LOOPBACK_TOPIC);
    statusListener.emit('statusChange', { online: true });
  });

  return new Promise((resolve, reject) => {
    mqtt_client.once('offline', () => resolve());
    mqtt_client.once('connect', () => resolve());
  });
};

/**
 * Publish a loopback message to the broker to determine if it's online.
 * @return - A promise containing true if the broker is online, false otherwise.
 */
const brokerOnline = async () => {
  try {
    await init_client();
    if (!mqtt_client.connected) return false;
    mqtt_client.publish(LOOPBACK_TOPIC, LOOPBACK_MESSAGE);
    const { value: [topic, message] } = await once(mqtt_client, 'message');
    return (topic == LOOPBACK_TOPIC) && (message.toString() == LOOPBACK_MESSAGE);
  } catch (err) {
    return Promise.reject(err);
  }
};

const brokerStatus = async () => {
  try {
    const online = await brokerOnline();
    return ({ online });
  } catch (err) {
    return Promise.reject(err);
  }
};

module.exports = { brokerStatus, statusListener };
//===========================================================================