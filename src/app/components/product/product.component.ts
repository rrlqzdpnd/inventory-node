import { DataSource } from '@angular/cdk';
import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import { MdDialog } from '@angular/material';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';

import { ProductService } from './product.service';
import { ProductDialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  providers: [ ProductService ]
})
export class ProductComponent {

  isDataReady = false;
  product: Product = null;
  productColumns: string[] = [];
  itemDataSource : ItemDataSource | null;
  itemList: ItemList | null;

  constructor(private _service: ProductService,
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef,
    public dialog: MdDialog) { }

  ngOnInit() {
    this._route.params.subscribe((params) => {
      this.isDataReady = false;

      let id = params.id;
      this._service.getProduct(id).toPromise().then((data: any) => {
        this.product = <Product>data.body.product;

        this.productColumns = this.product.columns.map(col => col.slug);
        this.productColumns.push('actions');

        this.itemList = new ItemList(this.product.items);
        this.itemDataSource = new ItemDataSource(this.itemList);
        this.isDataReady = true;

        this._changeDetector.detectChanges();
      });
    });
  }

  openDialog() {
    let dialog = this.dialog.open(ProductDialogComponent, {
      width: '500px',
      data: {
        id: this.product.id,
        columns: this.product.columns
      }
    });

    dialog.afterClosed().subscribe((data) => {
      this.itemList.add(data);
    });
  }

  deleteItem(itemId) {
    this._service.deleteItem(this.product.id, itemId)
    .toPromise()
    .then((result: any) => {
      if(result.success)
        this.itemList.delete(itemId);
    });
  }

}

interface ProductColumn {
  id: number,
  name: string,
  slug?: string,
  type: string,
  is_required: boolean
}

interface ProductItem { }

export interface Product {
  id: number,
  name: string,
  slug?: string,
  is_active: boolean,
  description?: string,
  columns: Array<ProductColumn>,
  items: Array<ProductItem>
}

class ItemList {

  list: BehaviorSubject<ProductItem[]>;

  constructor(initial: ProductItem[]) {
    this.list = new BehaviorSubject<ProductItem[]>(initial);
  }

  get data(): ProductItem[] {
    return this.list.value;
  }

  /**
   * Expects Array of rows as input
   */
  add(rows) {
    let clone = this.data.slice();
    rows.forEach((row) => {
      clone.push(row);
    });
    this.list.next(clone);
  }

  delete(itemId) {
    this.list.next(
      this.data.filter((obj: any) => {
        return obj.id != itemId;
      })
    );
  }

}

class ItemDataSource extends DataSource<any> {

  constructor(private _itemList: ItemList) {
    super();
  }

  connect(): Observable<ProductItem[]> {
    return this._itemList.list;
  }

  disconnect() { }

}
