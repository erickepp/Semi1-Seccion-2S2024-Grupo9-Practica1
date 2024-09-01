import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

  public listSongs: any ;

  constructor(public menuCtrl: MenuController
    , public http: HttpClient
    , public appC: AppComponent
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.cargarCanciones();
  }

  cargarCanciones() {
    this.http.get('http://127.0.0.1:3000/songs', {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      this.listSongs = jsonData;

      console.log(jsonData);
    }, error => {
      console.log(error);
    });
  }

  reproducir(cancionR: string) {
    console.log(cancionR);
    this.appC.reproducir(cancionR);
  }

  agregarFavoritos(idCancion: string) {
    this.http.post('http://127.0.0.1:3000/favorites', {
      song_id: idCancion,
      user_id: 5
    })
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
  }

}
