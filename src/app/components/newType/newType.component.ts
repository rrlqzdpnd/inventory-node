import { Component, Input } from '@angular/core';

import { NewTypeService } from './newType.service';

@Component({
  selector: 'newType',
  templateUrl: './newType.component.html',
  providers: [
    NewTypeService
  ]
})
export class NewTypeComponent {
  productName = ""

  constructor(private service: NewTypeService) { }

  onKey(event: any) {
    this.productName = event.target.value
  }

  submit(): void {
    this.service.sendNewType(this.productName)
  }
}
