import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkTableModule } from '@angular/cdk';
import { NgModule } from '@angular/core';
import {
  HttpClientModule
} from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {
  MdButtonModule,
  MdCheckboxModule,
  MdIconModule,
  MdInputModule,
  MdListModule,
  MdSelectModule,
  MdSidenavModule,
  MdTableModule,
  MdToolbarModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NewTypeComponent } from './components/newType/newType.component';
import { ProductComponent } from './components/product/product.component';
import { SharedService } from './parentchild.service';

const routes: Routes = [
  { path: 'newType', component: NewTypeComponent },
  { path: 'product', redirectTo: '' },
  { path: 'product/:id', component: ProductComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    NewTypeComponent,
    ProductComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CdkTableModule,
    FormsModule,
    HttpClientModule,
    MdButtonModule,
    MdCheckboxModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdSelectModule,
    MdSidenavModule,
    MdTableModule,
    MdToolbarModule,
    RouterModule.forRoot(routes)
  ],
  providers: [ SharedService ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
