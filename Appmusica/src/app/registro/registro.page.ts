import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  public first_name: string = "";
  public last_name: string = "";
  public email: string = "";
  public password: string = "";
  public confirm_password: string = "";
  public fechaNacimiento: any;
  public sourceFile: any;
  public picImage:any;

  constructor(public menuCtrl: MenuController,
    public http: HttpClient
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  onUpload() {
  }

  registrar(){
    let usuarioForm = new FormData();
    console.log(this.sourceFile);
    usuarioForm.append("photo",this.sourceFile);
    usuarioForm.append("first_name",this.first_name);
    usuarioForm.append("last_name",this.last_name);
    usuarioForm.append("email",this.email);
    usuarioForm.append("password",this.password);
    usuarioForm.append("confirm_password",this.confirm_password);
    usuarioForm.append("birth_date",this.fechaNacimiento);


    this.http.post('http://127.0.0.1:3000/users', usuarioForm, {
      headers: new HttpHeaders({
        'enctype':'multipart/form-data'
      })
    })
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
    //
  }
}
