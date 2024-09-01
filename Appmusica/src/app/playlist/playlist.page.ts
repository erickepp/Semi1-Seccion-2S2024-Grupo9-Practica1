import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { ModalListaComponent } from '../modal-lista/modal-lista.component';
import { ModalAgregarCancionComponent } from '../modal-agregar-cancion/modal-agregar-cancion.component';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-playlist',
  templateUrl: './playlist.page.html',
  styleUrls: ['./playlist.page.scss'],
})
export class PlaylistPage implements OnInit {

  public listPlay: any ;

  constructor(public menuCtrl: MenuController
    , public http: HttpClient
    , private modalCtrl: ModalController
    , public appC: AppComponent
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.menuCtrl.enable(true);
    this.cargarListas();
  }

  cargarListas() {
    this.http.get('http://127.0.0.1:3000/song/playlists?user_id=5', {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
      this.listPlay = jsonData.playlists;
    }, error => {
      console.log(error);
    });
  }

  async agregar() {
    const modal = await this.modalCtrl.create({
      component: ModalAgregarCancionComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();
  }


  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalListaComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }

  reproducir(cancionR: string) {
    console.log(cancionR);
    this.appC.reproducir(cancionR);
  }

  eliminar(){
    this.http.delete('http://127.0.0.1:3000/playlists/2', {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
    //
  }

  eliminarCancion(){
    this.http.delete('http://127.0.0.1:3000/song/playlists?song_id=1&playlist_id=2', {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
    //
  }

}
