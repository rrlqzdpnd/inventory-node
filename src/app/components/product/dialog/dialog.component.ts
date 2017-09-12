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

  dType = DataType;
  values = {};

  constructor(public dialogRef: MdDialogRef<ProductDialogComponent>,
    @Inject(MD_DIALOG_DATA) public data: any,
    private _service: ProductDialogService) {
    this.values = this.data.columns.reduce(function(acc, curr) {
      acc[curr.id] = {
        type: curr.type,
        is_required: curr.is_required,
        value: (curr.type == DataType[DataType.Boolean]) ? false : null
      };
      return acc;
    }, {});
  }

  addItem() {
    this._service.createItem({
      productId: this.data.id,
      row: this.values
    })
    .toPromise()
    .then((result: any) => {
      if(result.success)
        this.dialogRef.close(result.body.newItem);
    })
  }

}
