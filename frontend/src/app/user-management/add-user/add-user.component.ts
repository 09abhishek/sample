import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConfirmationDialogService } from './../../shared/components/confirmation-dialog/confirmation-dialog.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import {each} from 'lodash';
import { UserService } from '../user.service';

@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {

  public userForm: any;
  private subscriptions: any = {};
  submitLoader = false;
  userId: any;
  userDetails: any;
  userType = [
    {name: 'Super Admin', type: 'super_admin'},
    {name: 'Admin', type: 'admin'},
    {name: 'Accountant', type: 'accountant'},
  ]
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private userService: UserService,
    private confirmationDialogService: ConfirmationDialogService) { }

  ngOnInit(): void {
    this.initForm();
    this.getRouteParams();
  }
  getRouteParams() {
    this.route.params.subscribe((params: any) => {
        if (params && params.id) {
          this.userId = params.id;
          this.getUserDetails(this.userId);
        } else {
            this.setPasswordValidatiors();
        }
    });
}
  getUserDetails(id: any) {
    this.subscriptions['getUserDetails'] = this.userService.getUserDetails(id).subscribe({
      next: (res) => {
        if(res && res.data) {
          this.userDetails = res.data[0];
          this.filluserForm(this.userDetails);
        }
      },
      error: (error)=> {
      }
    });
  }
  public initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      mobno: [''],
      privalageType: ['', [Validators.required]],
      password: ['', [Validators.minLength(5)]],
      confirmPassword: ['']
    }, {validator: this.mismatchingPasswords('password', 'confirmPassword')});
  }
  onSaveConfirmation() {
    if (!this.userForm.valid) {
      this.validateAllFormFields(this.userForm);
      return;
    }
    this.openConfirmationDialog();
  }
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({onlySelf: true});
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  mismatchingPasswords(passwordKey: string, confirmPasswordKey: string) {
    return (group: FormGroup): any => {
        const password = group.controls[passwordKey];
        const confirmPassword = group.controls[confirmPasswordKey];
        if (password.value !== confirmPassword.value) {
            return {
                mismatchedPasswords: true
            };
        }
    };
}
filluserForm(details: any) {
  this.userForm.get('username').setValue(details.username);
  this.userForm.get('firstname').setValue(details.first_name);
  this.userForm.get('lastname').setValue(details.last_name);
  // this.userForm.get('mobno').setValue(details.);
  this.userForm.get('privalageType').setValue(details.user_type);

  this.userForm.get('username').disable();
  this.userForm.get('firstname').disable();
  this.userForm.get('lastname').disable();
  if (details.user_type !== 'super_admin') {
    this.userForm.get('privalageType').disable();
  }
}
setPasswordValidatiors() {
  this.userForm.get('password').setValidators([Validators.required]);
  this.userForm.get('password').updateValueAndValidity();
  this.userForm.get('confirmPassword').setValidators([Validators.required]);
  this.userForm.get('confirmPassword').updateValueAndValidity();
}

  public openConfirmationDialog() {
    this.confirmationDialogService.confirm('Confirmation', "Are you sure you want to save User!",
        "Okay", "Cancel","success", "secondary")
        .then((confirmed) => {
            console.log('User confirmed:', confirmed);
            if (confirmed) {
              this.SaveUser();
            }
      })
       .catch(() => {
       console.log('User dismissed the dialog (e.g., by using ESC, clicking the cross icon, or clicking outside the dialog)');
    });
  }
  SaveUser() {
    this.submitLoader = true;
    const formValue = this.userForm.getRawValue();
    const params: any = {};
    // params.username = formValue.username;
    // params.firstName = formValue.firstname;
    // params.lastName = formValue.lastname;
    // params.mobileNum = formValue.mobno;
    // if (formValue.privalageType === 'super_admin') {
      params.userType = formValue.privalageType;
    // }
    params.password = formValue.password;

    this.subscriptions['saveUser'] = this.userService.register(params).subscribe({
      next: (res) => {
        if(res) {
          this.submitLoader = false;
        }
      },
      error: (error)=> {
        this.submitLoader = false;
      }
    });
  }
  reset() {
    if(this.userId) {

    } else {
      this.userForm.reset();
    }
  }
  ngOnDestroy(): void {
    each(this.subscriptions, (subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }
}
