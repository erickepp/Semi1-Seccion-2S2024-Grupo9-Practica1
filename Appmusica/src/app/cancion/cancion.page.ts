import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { ModalCancionComponent } from '../modal-cancion/modal-cancion.component';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-cancion',
  templateUrl: './cancion.page.html',
  styleUrls: ['./cancion.page.scss'],
})
export class CancionPage implements OnInit {

  public listSongs: any ;

  constructor(public menuCtrl: MenuController
    , public http: HttpClient
    , private modalCtrl: ModalController
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

  async openModal() {
    const modal = await this.modalCtrl.create({
      component: ModalCancionComponent,
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

  }

  reproducir(cancionR: string) {
    console.log(cancionR);
    this.appC.reproducir(cancionR);
  }
}
