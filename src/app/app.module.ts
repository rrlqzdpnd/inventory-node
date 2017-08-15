import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import {
  MdButtonModule,
  MdGridListModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdSidenavModule,
  MdToolbarModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NewTypeComponent } from './components/newType/newType.component';

const routes: Routes = [
  {
    path: 'newType',
    component: NewTypeComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    NewTypeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MdButtonModule,
    // MdGridListModule,
    MdIconModule,
    // MdInputModule,
    // MdListModule,
    MdSidenavModule,
    MdToolbarModule,
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
