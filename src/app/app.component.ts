import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataTablesModule } from "angular-datatables";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../servicios/usuarios.service';
import { usuarios } from '../modelos/usuarios';
import Swal from 'sweetalert2';
import { CambiarTemaService } from '../servicios/cambiar-tema.service';
import { error } from 'jquery';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DataTablesModule, CommonModule,
    FormsModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit {

  constructor(private usuarioServicio: UsuariosService, private cambiarTema: CambiarTemaService) { }

  filteredData: any; // Datos filtrados que se mostrarán en el DataTable
  dataTable: any;
  usuariosListaEndPoint: usuarios[] = [];
  usuariosLista: any[] = [];

  toggleTheme() {
    this.cambiarTema.toggleTheme();
  }

  ngAfterViewInit(): void {
    this.cargarDatosUsuario();
  }

  cargarDatosUsuario() {
    let idUsuario = 0;
    this.usuarioServicio.ObtenerUsuarios().then(response => {
      this.usuariosListaEndPoint = response;
      this.usuariosListaEndPoint.forEach(usuario => {
        idUsuario = idUsuario + 1;
        this.usuariosLista.push({
          idUsuario: idUsuario, nombreCompleto: usuario.usuarioNombre + ' ' + usuario.usuarioApellidoPaterno + ' ' + usuario.usuarioApellidoMaterno,
          usuarioEmail: usuario.usuarioEmail, usuarioTelefono: usuario.usuarioTelefono, foto: null
        });
      }); //for each para concatenar el nombre con los apellido y poder filtrarlo por nombre completo y agregar un id a cada registro

      this.inicializarDataTable();

    }).catch(() => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Hubo un error al cargar los datos!",
        footer: '<a href="#">Error servidor?</a>',
        confirmButtonColor: "rgb(0, 195, 234)",
      });
    })
  }

  inicializarDataTable() {
    this.dataTable = ($('#miDataTable') as any).DataTable({
      data: this.usuariosLista,
      columns: [
        {
          title: 'Número de registro',
          data: 'idUsuario'
        },
        { title: 'Nombre Completo ', data: 'nombreCompleto' },
        { title: 'Teléfono', data: 'usuarioEmail' },
        { title: 'Correo Electrónico', data: 'usuarioTelefono' },
        {
          title: 'Foto', data: null,
          render: (row: any) => {
            // Botón de eliminar
            return `
            ${row.foto ? `
              <div class="foto-container">
              <img src="${row.foto}" data-id="${row.foto}" data-nombre-id="${row.nombreCompleto}" class="foto" width="40px" height="40px" alt="foto">
              <div style="transition: .5s ease;
                    color:white;
                    opacity: 0;
                    position: absolute;
                    top: 50%;
                   left: 50%;
                   transform: translate(-50%, -50%);
                   -ms-transform: translate(-50%, -50%);
                   pointer-events: none;
                   " class="middle">
                <i class="bi bi-eye-fill"></i>
              </div>
              </div>

              ` : '<p style="margin: 0;">Sin Foto</p>'}
            `;
          }
        },
        {
          title: 'Acciones', data: null, className: 'text-center',
          render: (row: any) => {
            // Botón de eliminar
            return `<div style="display: flex; justify-content: center; align-items: center; flex-direction: row;">
            <button style="margin-right: 10px;" class="btn-foto btn btn-info btn-sm" data-id="${row.idUsuario}" ><i class="bi bi-camera-fill"></i></button>
            <button style="margin-right: 10px;" class="btn-eliminar btn btn-danger btn-sm" data-id="${row.idUsuario}" ><i class="bi bi-trash-fill"></i></button>
            </div>
            `;
          }
        },
      ],
      lengthMenu: [10, 20, 30, 40, 50, 60, 70],
      paging: true,
      pageLength: 10,
      searching: false, // Desactiva el campo de búsqueda de DataTable
      pagingType: 'full_numbers',
      language: {
        lengthMenu: 'Mostrar _MENU_ registros por página',
        emptyTable: "No se encontraron registros.",
        info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
        infoEmpty: 'No hay registros disponibles',
        infoFiltered: '(filtrado de _MAX_ registros en total)',
        paginate: {
          first: 'Primero',
          last: 'Último',
          next: 'Siguiente',
          previous: 'Anterior'
        }
      }, columnDefs: [
        {

          targets: [4],
          createdCell: (td: HTMLElement) => {
            $(td).css("min-width", "140px");
          }
        },
        {

          targets: [0],
          width: "200px",
        },
        {

          targets: [5],
          width: "200px",
          createdCell: (td: HTMLElement) => {
            $(td).css("min-width", "120px");
          }
        }
      ]
    });
  }

  filtrarPorNombre(event: Event): void {
    const input = event.target as HTMLInputElement; // Convertimos el tipo a HTMLInputElement
    const nombre = input.value;

    this.filteredData = this.usuariosLista.filter(item =>
      this.quitarAcentos(item.nombreCompleto.toLowerCase()).includes(nombre.toLowerCase())

    );

    // Destruye la instancia actual y crea una nueva con los datos filtrados
    this.dataTable.clear().rows.add(this.filteredData).draw();
  }

  ngOnInit(): void {
    $(document).ready(() => {

      // Delegar el evento de clic al botón eliminar
      $('#miDataTable').on('click', '.btn-eliminar', (event) => {

        const button = event.currentTarget as HTMLButtonElement;
        const id = button.getAttribute('data-id');

        Swal.fire({
          title: "¿Estas seguro que desea eliminar el registro?",
          text: "Esta accion  no se puede revertir!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "rgb(0, 195, 234)",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, Eliminar!"
        }).then((result) => {
          if (result.isConfirmed) {
            const row = $(button).closest('tr');
            row.css('opacity', '0');
            row.css('transition', 'opacity 0.5s ease, transform 0.5s ease');
            row.css('transform', 'translateX(-50px)');
            setTimeout(() => {
              this.eliminarUsuario(id);
            }, 500)

          }
        });

      });


      $('#miDataTable').on('click', '.btn-foto', (event) => {
        const id = $(event.currentTarget).data('id');
        this.abrirCamara(id);
      });


      $('#miDataTable').on('mouseenter', '.foto-container', function () {
      
        $(this).css({
          'position': 'relative',
          'width': '40px',
          'heigth': '40px',
          'opacity': '0.2',
          'background-color': 'black', // Fondo oscuro semi-transparente
          'cursor':'pointer'
        });

        $(this).find('.middle').css({
         'opacity': '1'
        });
      }).on('mouseleave', '.foto-container', function () {
        // Cuando el mouse sale del botón, restaura los estilos
        $(this).css({
          'transform': 'scale(1)',
          'background-color': 'transparent', // Fondo transparente de nuevo
          'opacity': '1'
        });

        $(this).find('.middle').css({
          'opacity': '0'
         });
      });

      $('#miDataTable').on('click', '.foto', (event) => {
        const foto = $(event.currentTarget).data('id');
        const nombre = $(event.currentTarget).data('nombre-id');
        this.abrirImagen(foto, nombre);
      });

    });
  }
  title = 'Prueba-Front-FSG';

  abrirImagen(imagen: any, nombre: string) {
    Swal.fire({
      title: "Foto de: " + nombre,
      imageUrl: imagen,
      imageAlt: "Foto",
      confirmButtonColor: "rgb(0, 195, 234)",
    });
  }

  quitarAcentos(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  }

  eliminarUsuario(id: any): void {

    this.usuariosLista = this.usuariosLista.filter(usuario => usuario.idUsuario != id);
    this.dataTable.clear().rows.add(this.usuariosLista).draw();

  }

  abrirCamara(id: any) {
    let videoStream: MediaStream | null = null;
    Swal.fire({
      title: 'Capturar Foto',
      html: `
        <video id="video" autoplay style="width: 100%;"></video>
        <canvas id="canvas" style="display: none;"></canvas>
      `,
      showCancelButton: true,
      confirmButtonText: 'Capturar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: "rgb(0, 195, 234)",
      allowOutsideClick: false,
      willOpen: () => {
        Swal.getConfirmButton()?.setAttribute('disabled', 'true'); // Desactiva el botón
        Swal.getCancelButton()?.setAttribute('disabled', 'true');
      },
      didOpen: () => {
        // Accede al elemento de video y configura la cámara
        const video = document.getElementById('video') as HTMLVideoElement;
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            videoStream = stream;
            video.srcObject = stream;

            setTimeout(() => {
              Swal.getConfirmButton()?.removeAttribute('disabled');
              Swal.getCancelButton()?.removeAttribute('disabled');
            }, 500)

          })
          .catch(error => {
            console.error('Error al acceder a la cámara', error);
          });

      },
      preConfirm: () => {
        // Captura la foto en formato base64
        const video = document.getElementById('video') as HTMLVideoElement;
        const canvas = document.getElementById('canvas') as HTMLCanvasElement;
        const contexto = canvas.getContext('2d');

        if (contexto && video) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          contexto.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convierte la imagen a base64
          const fotoBase64 = canvas.toDataURL('image/png');

          // Detiene la cámara
          const stream = video.srcObject as MediaStream;
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());

          return fotoBase64;
        }
        return null;
      },
      willClose: () => {
        // Detener la cámara al cerrar el modal
        if (videoStream) {
          const tracks = videoStream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: "Foto Capturada",
          text: "La foto se ha capturado correctamente.",
          icon: "success",
          confirmButtonColor: "rgb(0, 195, 234)",
        });
        this.usuariosLista = this.usuariosLista.map(usuario => {
          if (id == usuario.idUsuario) {
            return { ...usuario, foto: result.value };
          }
          return usuario;
        });

        this.dataTable.clear().rows.add(this.usuariosLista).draw();
      }
    });
  }

}
