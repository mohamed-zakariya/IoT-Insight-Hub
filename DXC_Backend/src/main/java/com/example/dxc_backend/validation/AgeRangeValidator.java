package com.example.dxc_backend.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Date;
import java.util.Calendar;

public class AgeRangeValidator implements ConstraintValidator<AgeRange, Date> {

    private int min;
    private int max;

    @Override
    public void initialize(AgeRange ageRange) {
        this.min = ageRange.min();
        this.max = ageRange.max();
    }

    @Override
    public boolean isValid(Date dob, ConstraintValidatorContext context) {
        if (dob == null) return false;

        Calendar birthDate = Calendar.getInstance();
        birthDate.setTime(dob);
        int age = getAge(birthDate);

        return age >= min && age <= max;
    }

    private int getAge(Calendar birthDate) {
        Calendar today = Calendar.getInstance();
        int age = today.get(Calendar.YEAR) - birthDate.get(Calendar.YEAR);
        if (today.get(Calendar.MONTH) < birthDate.get(Calendar.MONTH) ||
                (today.get(Calendar.MONTH) == birthDate.get(Calendar.MONTH) && today.get(Calendar.DAY_OF_MONTH) < birthDate.get(Calendar.DAY_OF_MONTH))) {
            age--;
        }
        return age;
    }
}
