import { DataSource } from '@angular/cdk';
import {
  ChangeDetectorRef,
  Component
} from '@angular/core';
import {
  ActivatedRoute,
  ParamMap
} from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';

import { ProductService } from './product.service';

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
  itemList : ItemDataSource | null;

  constructor(private _service: ProductService,
    private _route: ActivatedRoute,
    private _changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    this._route.params.subscribe((params) => {
      this.isDataReady = false;

      let id = params.id;
      this._service.getProduct(id).toPromise().then((data: any) => {
        this.product = <Product>data.body.product;

        this.productColumns = this.product.columns.map(col => col.slug);

        this.itemList = new ItemDataSource(this.product.items);
        this.isDataReady = true;

        this._changeDetector.detectChanges();
      });
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

interface ProductItem {

}

export interface Product {
  id: number,
  name: string,
  slug?: string,
  is_active: boolean,
  description?: string,
  columns: Array<ProductColumn>,
  items: Array<ProductItem>
}

class ItemDataSource extends DataSource<any> {

  constructor(private _itemList: Array<ProductItem>) {
    super();
  }

  connect(): Observable<Array<ProductItem>> {
    return Observable.of(this._itemList);
  }

  disconnect() { }

}
