import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit  } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-modal-cancion',
  templateUrl: './modal-cancion.component.html',
  styleUrls: ['./modal-cancion.component.scss'],
})
export class ModalCancionComponent  implements OnInit {
  
  public nameSong: string = "";
  public duration: string = "";
  public artist: string = "";
  public sourceFile: any;
  public sourceFile2: any;
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

  async chooseFile2(event: any) {
    this.sourceFile2 = event.target.files[0];
  }
  crear(){
    let usuarioForm = new FormData();
    console.log(this.nameSong);
    usuarioForm.append("photo",this.sourceFile);
    usuarioForm.append("file",this.sourceFile2);
    usuarioForm.append("name","cumple");
    usuarioForm.append("duration","5");
    usuarioForm.append("artist","desconocido");

    this.http.post('http://127.0.0.1:3000/songs', usuarioForm, {
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
