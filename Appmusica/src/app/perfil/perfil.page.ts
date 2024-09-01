import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  public first_name: string = "";
  public last_name: string = "";
  public email: string = "";
  public password: string = "";
  public confirm_password: string = "";
  public fechaNacimiento: any;
  public sourceFile: any;
  public picImage:any;


  constructor(public menuCtrl: MenuController
    ,public http: HttpClient
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.cargarDatos();
  }


  cargarDatos() {
    this.http.get('http://127.0.0.1:3000/users/5', {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.first_name = jsonData["first_name"];
      this.last_name = jsonData["last_name"];
      this.email = jsonData["email"];
      this.fechaNacimiento = jsonData["birth_date"];
      this.picImage = jsonData["photo"];
    }, error => {
      console.log(error);
    });
  }

  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  modificar() {
    let usuarioForm = new FormData();
    console.log(this.sourceFile);
    usuarioForm.append("photo",this.sourceFile);
    usuarioForm.append("first_name",this.first_name);
    usuarioForm.append("last_name",this.last_name);
    usuarioForm.append("email",this.email);
    usuarioForm.append("password",this.password);
    usuarioForm.append("confirm_password",this.confirm_password);
    usuarioForm.append("birth_date",this.fechaNacimiento);


    this.http.patch('http://127.0.0.1:3000/users/5', usuarioForm, {
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
  }

}
