// path: com.example.dxc_backend/converter/StringToSensorTypeConverter.java
package com.example.dxc_backend.converter;

import com.example.dxc_backend.enums.SensorType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

@Component
public class StringToSensorTypeConverter implements Converter<String, SensorType> {

    @Override
    public SensorType convert(String source) {
        return SensorType.valueOf(source.toUpperCase());
    }
}
