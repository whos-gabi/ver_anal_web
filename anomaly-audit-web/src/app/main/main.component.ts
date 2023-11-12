import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { CommunicationService } from '../communication.service';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, MatProgressBarModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
  providers: [CommunicationService],
})
export class MainComponent {
  title = 'anonaly-audit-web';
  loadingBar: boolean = false;
  // Declare the FormGroup for the form
  auditForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private communicationService: CommunicationService
  ) {
    // Initialize the form in the constructor
    this.auditForm = this.formBuilder.group({
      company_name: ['', Validators.required],
      company_website: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Implement OnInit if needed
  }

  // Add a method to handle form submission
  onSubmit(): void {
    // Access form values
    const companyName = this.auditForm.get('company_name')?.value;
    const companyWebsite = this.auditForm.get('company_website')?.value;

    // Perform actions with the form data, for example, call the checkAudit function
    const auditResult = this.checkAudit({
      name: companyName,
      website: companyWebsite,
    });

    // Log the result or perform other actions
    console.log(auditResult);
  }

  // Your existing checkAudit function
  checkAudit(data: any) {
    this.loadingBar = true;
    this.communicationService.fetchAudit(data).subscribe((res) => {
      console.log(res);
      this.loadingBar = false;
    });
    return data;
    // ... (your existing checkAudit function logic goes here)
  }
}
@NgModule({
  // declarations: [],
  // bootstrap: [MainComponent],
})
export class MainModule {}
