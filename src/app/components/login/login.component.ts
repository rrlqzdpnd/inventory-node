import { Component, Input } from '@angular/core';

@Component({
  selector: 'login',
  templateUrl: './login.html',
  // styleUrls: ['./login.css']
})
export class LoginComponent {
  title = "Errol Pineda"
  @Input() __state:Object;
}
