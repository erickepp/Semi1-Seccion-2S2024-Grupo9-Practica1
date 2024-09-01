import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-agregar-cancion',
  templateUrl: './modal-agregar-cancion.component.html',
  styleUrls: ['./modal-agregar-cancion.component.scss'],
})
export class ModalAgregarCancionComponent  implements OnInit {

  public listSongs: any ;

  constructor(public http: HttpClient) { }

  ngOnInit() {
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

  agregar(){
    this.http.post('http://127.0.0.1:3000/songs/playlists', {
      song_id: 5,
      playlist_id: 1
    }, {})
    .subscribe(data => {
      let jsonData = JSON.parse(JSON.stringify(data));
      console.log(jsonData);
    }, error => {
      console.log(error);
    });
    //
  }


}
