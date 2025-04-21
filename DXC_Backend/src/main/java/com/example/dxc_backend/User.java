package com.example.dxc_backend;

import jakarta.persistence.*;
import lombok.Data;

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

    @Column(nullable = false , unique = true)
    private String username;


    @Column(nullable = true)
    private String age;

    @Column(nullable = true)
    private String current_postion;

    @Column(nullable = true)
    private String location;

    @Column(nullable = true)
    private String description;


}
