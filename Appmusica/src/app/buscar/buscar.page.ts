import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-buscar',
  templateUrl: './buscar.page.html',
  styleUrls: ['./buscar.page.scss'],
})
export class BuscarPage implements OnInit {

  public listSongs: any ;
  public listSongsT: any ;
  public nameCancion: string = "";

  
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
      this.listSongsT = jsonData;
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
  }

  reproducir(cancionR: string) {
    console.log(cancionR);
    this.appC.reproducir(cancionR);
  }

  buscarCancion() {
    this.listSongs = this.listSongsT.filter((cancion: any) => cancion.name.includes(this.nameCancion));
  }
}
