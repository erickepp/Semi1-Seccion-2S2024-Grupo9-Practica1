import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { HTTP } from '@awesome-cordova-plugins/http/ngx';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public correo: string = "paulo@gmail.com";
  public pass: string = "";
  public mensaje: string = "";

  constructor(public menuCtrl: MenuController, 
    private router: Router,
    public http: HttpClient
  ) {}

  ngOnInit() {
  }

  ionViewWillEnter() {
    //this.menuCtrl.enable(false);
  }

  irInicio(){
    this.http.post('http://127.0.0.1:3000/login', {email: this.correo, password: this.pass}, {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.mensaje = jsonData['message'];
      this.router.navigate(['/inicio'])
    }, error => {
      console.log(error);
      this.mensaje = "Hubo un error al ingresar";
    });
    //
  }

  irRegistro(){
    this.router.navigate(['/registro'])
  }
}
