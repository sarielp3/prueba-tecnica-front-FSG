import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import axios, { Axios } from 'axios';
import { usuarios } from '../modelos/usuarios';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private endPoint = 'https://www.4sides.com.mx/api/prueba-tecnica/usuarios/index?results=50';
  constructor() { }

  ObtenerUsuarios(){
    return axios.get(this.endPoint).then(response =>
    {
      return response.data.usuarios;
    }
    )
    .catch(error =>
      {
        console.error('Error al realizar la peticion GET: ', error);
        throw error;
      }
    );
  }
}
