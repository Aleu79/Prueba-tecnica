import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';
import { ClienteService } from '../../services/cliente.service';
import { DescuentoService } from '../../services/descuento.service';
import { HistorialService } from '../../services/historial.service';
import { AdminStateService } from '../../services/admin-state.service';
import { Cliente } from '../../models/cliente';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, CapitalizePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class AdminDashboardComponent {
  tituloSeccionActual: string = 'Panel de Administración';

  mostrarClientesVIP = false;
  mostrarClientesNoVIP = false;
  mostrarCrearDescuento = false;
  mesSeleccionado: string = '';
  historialVIP: any[] = [];
  
  mostrarHistorialVIP = false;

  nuevoDescuento = {
    fecha_especial: '',
    monto_minimo: null,
    descuento: null,
    descripcion: ''
  };
  
  clientesVIP: Cliente[] = [];
  clientesNoVIP: Cliente[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private descuentoService: DescuentoService,
    private historialService: HistorialService,
    private clienteService: ClienteService,
    private adminState: AdminStateService
  ) {
    this.mesSeleccionado = new Date().toISOString().slice(0, 7);
    this.adminState.seccionActual$.subscribe((seccion) => {
      this.resetearSecciones();

      switch (seccion) {
        case 'vip':
          this.tituloSeccionActual = 'Clientes VIP';
          this.mostrarClientesVIP = true;
          this.consultarClientesVIP();
          break;
        case 'noVip':
          this.tituloSeccionActual = 'Clientes no VIP';
          this.mostrarClientesNoVIP = true;
          this.consultarClientesNoVIP();
          break;
        case 'descuentos':
          this.tituloSeccionActual = 'Crear descuento especial';
          this.mostrarCrearDescuento = true;
          break;
        case 'historial':
          this.tituloSeccionActual = 'Historial de cambios VIP';
          this.mostrarHistorialVIP = true;
          break;
        default:
          this.tituloSeccionActual = 'Panel de administración';
      }
    });
  }

  resetearSecciones() {
    this.mostrarClientesVIP = false;
    this.mostrarClientesNoVIP = false;
    this.mostrarCrearDescuento = false;
    this.mostrarHistorialVIP = false;
  }

  consultarClientesVIP() {
    this.clienteService.obtenerClientesVIP().subscribe({
      next: (data) => this.clientesVIP = data,
      error: (err) => console.error('Error al obtener clientes VIP:', err)
    });
  }
  

  consultarClientesNoVIP() {
    this.clienteService.obtenerClientesNoVIP().subscribe({
      next: (data) => this.clientesNoVIP = data,
      error: (err) => console.error('Error al obtener clientes No VIP:', err)
    });
  }

crearDescuento() {
  const d = this.nuevoDescuento;
  if (!d.fecha_especial || d.monto_minimo == null || d.descuento == null || !d.descripcion) {
    alert('Por favor, complete todos los campos');
    return;
  }

  this.descuentoService.crearDescuento(d).subscribe({
    next: () => {
      alert('Descuento creado exitosamente');
      this.nuevoDescuento = {
        fecha_especial: '',
        monto_minimo: null,
        descuento: null,
        descripcion: ''
      };
    },
    error: (err: any) => {
      console.error('Error al crear descuento:', err);
      alert('Ocurrió un error al crear el descuento');
    }
  });
}


  cargarHistorial() {
    if (!this.mesSeleccionado) return;

    this.historialService.obtenerHistorial(this.mesSeleccionado).subscribe({
      next: (data) => {
        const entrantes = data.vip_entrantes.map((item: any) => ({
          username: item.username,
          fecha_cambio: item.fecha,
          accion: 'Se volvió VIP'
        }));

        const salientes = data.vip_salientes.map((item: any) => ({
          username: item.username,
          fecha_cambio: item.fecha,
          accion: 'Dejó de ser VIP'
        }));

        this.historialVIP = [...entrantes, ...salientes].sort(
          (a, b) => new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime()
        );
      },
      error: (err) => {
        console.error('Error al obtener historial:', err);
        alert('Error al cargar historial');
      }
    });
  }

}  