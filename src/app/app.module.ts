import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { NewFeedbackComponent } from './new-feedback/new-feedback.component';
import { CustomDropDownComponent } from './custom-drop-down/custom-drop-down.component';

@NgModule({
  declarations: [AppComponent, NewFeedbackComponent, CustomDropDownComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
