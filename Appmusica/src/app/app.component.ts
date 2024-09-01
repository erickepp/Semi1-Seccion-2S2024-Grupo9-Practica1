import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Inicio', url: '/inicio', icon: 'home' },
    { title: 'Perfil', url: '/perfil', icon: 'person' },
    { title: 'Playlist', url: '/playlist', icon: 'list' },
    { title: 'Favoritos', url: '/favoritos', icon: 'heart' },
    { title: 'Buscar', url: '/buscar', icon: 'search' },
    { title: 'Canciones', url: '/cancion', icon: 'musical-notes' },
    { title: 'Salir', url: '/login', icon: 'exit' },
  ];
  public data : string = "";
  public labels = [];
  constructor() {

  }

  reproducir(reproducirCancion: string) {
    this.data = "<audio controls autoplay><source src='" + reproducirCancion + "' type='audio/mp3'></audio>";
    //document.findElementById('audio').innerHTML = str;
  }
}
