import { Component } from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import 'rxjs/add/operator/switchMap';

import { ProductService } from './product.service';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  providers: [ ProductService ]
})
export class ProductComponent {

  constructor(private _service: ProductService, private _route: ActivatedRoute) { }

  ngOnInit() {
    this._route.paramMap.switchMap((params: ParamMap) => {
      return this._service.getProduct(+params.get('id'))
    })
    .subscribe((data) => {
      console.log(data)
    });
  }

}
