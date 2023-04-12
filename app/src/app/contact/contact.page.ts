import { Component, OnInit } from '@angular/core';
import { Settings } from '../data/settings';
import { ApiService } from '../api.service';
import { Product } from '../data/product';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.page.html',
  styleUrls: ['./contact.page.scss'],
})
export class ContactPage implements OnInit {

  constructor(public settings: Settings, public api: ApiService, public productData: Product) { }
  form: any = {};
  status: any = {};
  disableButton: boolean = false;
  contactUsLink: any = '/wp-json/contact-form-7/v1/contact-forms/10/feedback';
  ngOnInit() {
  }

  submit(){
  this.disableButton = true;
	this.api.ajaxCall(this.contactUsLink, this.form).then(res => {
		this.disableButton = false;
        this.status = res;
    }, err => {
        console.log(err);
    });
  }

}
