export interface BaseSensorReading {
  id: string;
  location: string;
  timestamp: string | Date;
  sensorType?: 'streetLight' | 'traffic' | 'airPollution'; // ← optional
}



// This interface serves as a base for all sensor readings, ensuring that each reading has a unique ID, a location, a timestamp, and a type of sensor.
// wi will use it for the refactoring part to  factory pattern  and startegy on the service level 