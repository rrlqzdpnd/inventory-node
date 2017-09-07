import {
  Component,
  Inject
} from '@angular/core';
import {
  MdDialogRef,
  MD_DIALOG_DATA
} from '@angular/material';

import { DataType } from '../../newType/newType.component';
import { ProductDialogService } from './dialog.service';

@Component({
  selector: 'product-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
  providers: [ ProductDialogService ]
})
export class ProductDialogComponent {

  dataTypeEnum = DataType;
  values = {}

  constructor(public dialogRef: MdDialogRef<ProductDialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private _service: ProductDialogService) { }

  addItem() {
    this._service.createItem({
      id: this.data.id,
      row: this.values
    })
    .toPromise()
    .then((result) => {
      console.log(result);
    })
  }

}
