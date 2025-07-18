package com.example.dxc_backend.model;

import jakarta.persistence.*;
import lombok.Data;

// Don't use the data on the util.Date becase its det it to Date(6) and not same with the sql
import java.sql.Date;


@Entity
@Data
@Table(name = "user")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String username;


    @Column(nullable = true)
    private Date dob;

    @Column(nullable = true)
    private String current_postion;

    @Column(nullable = true)
    private String location;

    @Column(nullable = true)
    private String description;

    @Column(nullable = true, length = 6) // Ensures max length is 6
    private String gender;


    //this for handeling the data beetwen the the male and femlae resterctions





    // Override the setter for gender to add validation logic
    public void setGender(String gender) {
        if (!"Male".equalsIgnoreCase(gender) && !"Female".equalsIgnoreCase(gender)) {
            throw new IllegalArgumentException("Invalid gender. Allowed values are 'Male' or 'Female'.");
        }
        this.gender = gender;
    }



}
