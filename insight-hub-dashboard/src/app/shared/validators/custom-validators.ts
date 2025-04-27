import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  static noWhitespace(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }

  static username(control: AbstractControl): ValidationErrors | null {
    const value: string = (control.value || '').trim();

    // Must be between 5 to 30 characters long (stronger requirement)
    if (value.length < 5 || value.length > 30) {
      return { invalidLength: true }; // Adjusted min length to 5
    }

    // Must start with a letter
    if (!/^[a-zA-Z]/.test(value)) {
      return { mustStartWithLetter: true };
    }

    // Allowed characters only: a-z, A-Z, 0-9, _, ., -
    if (!/^[a-zA-Z0-9._-]+$/.test(value)) {
      return { invalidCharacters: true };
    }

    // No spaces allowed
    if (/\s/.test(value)) {
      return { containsSpaces: true };
    }

    // No consecutive special characters (like __, .., --)
    if (/[._-]{2,}/.test(value)) {
      return { consecutiveSpecials: true };
    }

    // No leading or trailing special characters
    if (/^[._-]|[._-]$/.test(value)) {
      return { leadingOrTrailingSpecial: true };
    }

    // Optional: Reserved usernames (like 'admin', 'root', 'system', etc.)
    const reserved = ['admin', 'root', 'system', 'test', 'guest'];
    if (reserved.includes(value.toLowerCase())) {
      return { reservedWord: true };
    }

    // Optional: Prevent common username patterns (e.g., 'user123', 'qwerty', 'password')
    const commonPatterns = [
      /^(user|admin|guest|test)[0-9]{1,3}$/,  // e.g., 'user123', 'admin999'
      /^(password|qwerty|1234|abc)/,         // Common passwords or patterns
    ];
    for (const pattern of commonPatterns) {
      if (pattern.test(value.toLowerCase())) {
        return { commonPattern: true };
      }
    }

    return null;
}

  

  static name(control: AbstractControl): ValidationErrors | null {
    const value: string = (control.value || '').trim();

    if (!value) {
      return { required: true };
    }

    if (value.length < 2 || value.length > 50) {
      return { invalidLength: true };
    }

    // Allows letters (including accents), hyphens, apostrophes, and spaces
    if (!/^[a-zA-ZÀ-ÖØ-öø-ÿ' -]+$/.test(value)) {
      return { invalidCharacters: true };
    }

    return null;
  }


  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value: string = control.value || '';
  
    if (!value) return { required: true };
  
    if (value.length < 8) {
      return { minLength: true };
    }
  
    if (value.length > 64) {
      return { maxLength: true };
    }
  
    // Check for uppercase, lowercase, number, and special character
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^A-Za-z0-9]/.test(value);
  
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return { weakPassword: true };
    }
  
    return null;
  }
  


  static ageRange(minAge: number, maxAge: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const dob = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (isNaN(age) || age < minAge || age > maxAge) {
        return { invalidAge: true };
      }

      return null;
    };
  }

    static passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
      const ps = control.get('password')?.value;
      const cps = control.get('confirmPassword')?.value;
      return ps === cps ? null : { mismatch: true };
    };
  
  
    static customEmailValidator(control: AbstractControl): ValidationErrors | null {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // Ensure at least one "." after @ and at least 2 letters
      const value = control.value;
    
      if (!value) {
        return null; // Let required validator handle empty cases
      }
    
      return emailRegex.test(value) ? null : { invalidEmail: true };
    }
}
