import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-modal-lista',
  templateUrl: './modal-lista.component.html',
  styleUrls: ['./modal-lista.component.scss'],
})
export class ModalListaComponent  implements OnInit {

  public nameSong: string = "";
  public duration: string = "";
  public artist: string = "";
  public sourceFile: any;
  public picImage:any;

  constructor(public http: HttpClient
  ) { }

  ngOnInit() {}

  
  async chooseFile(event: any) {
    this.sourceFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(this.sourceFile);
    reader.addEventListener('load', (event) => {
      this.picImage = reader.result;
    });
  }

  crear(){
    let usuarioForm = new FormData();
    console.log(this.nameSong);
    usuarioForm.append("background",this.sourceFile);
    usuarioForm.append("name","cumple");
    usuarioForm.append("description","nueva lista");
    usuarioForm.append("user_id","5");

    this.http.post('http://127.0.0.1:3000/playlists', usuarioForm, {
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
