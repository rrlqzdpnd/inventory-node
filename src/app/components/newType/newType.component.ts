import { DataSource } from '@angular/cdk';
import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { NewTypeService } from './newType.service';

@Component({
  selector: 'newType',
  templateUrl: './newType.component.html',
  styleUrls: [ './newType.component.css' ],
  providers: [
    NewTypeService
  ]
})
export class NewTypeComponent {

  dataTypes: Array<any> = [];
  propertyList: PropertyDataSource | null;
  displayedColumns: Array<string> = [ 'name', 'type', 'length', 'isRequired', 'actions' ];

  name: string = "";
  properties: PropertyList =  new PropertyList();
  response: any;

  constructor(private service: NewTypeService) {
    var dataTypeKeys = Object.keys(DataType);
    dataTypeKeys.slice(dataTypeKeys.length / 2).forEach((val, key) => {
      this.dataTypes.push({
        id: key,
        name: val
      });
    });
  }

  ngOnInit() {
    this.propertyList = new PropertyDataSource(this.properties);
  }

  submit(): void {
    var params = {
      name: this.name,
      properties: this.properties.data
    }

    this.service.sendNewType(params).subscribe((data) => {
      this.response = data;
    })
  }

}

export enum DataType {
  String,
  Integer,
  Boolean
}
interface Property {
  id: number;
  name: string;
  type: DataType;
  length: number;
  isRequired: boolean;
}

class PropertyList {

  dataList: BehaviorSubject<Property[]> = new BehaviorSubject<Property[]>([]);

  get data(): Property[] {
    return this.dataList.value;
  }

  addProperty(): void {
    let clone = this.data.slice();
    clone.push(this._randomize());
    this.dataList.next(clone);
  }

  removeProperty(id: number): void {
    this.dataList.next(this.data.filter((obj) => {
      return obj.id != id;
    }))
  }

  private _getLastId(): number {
    let last = this.data.slice(-1)[0];
    if(last)
      return last.id;
    return 0;
  }

  private _randomize() {
    return {
      id: this._getLastId() + 1,
      name: '',
      type: DataType.String,
      length: 48,
      isRequired: false
    }
  }

}

class PropertyDataSource extends DataSource<any> {

  constructor(private _propertyList: PropertyList) {
    super();
  }

  connect(): Observable<Property[]> {
    return this._propertyList.dataList;
  }

  disconnect() { }

}
