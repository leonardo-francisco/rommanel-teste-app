import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../service/client.service';
import { Router, RouterModule } from '@angular/router';
import { Client } from '../../model/client.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule ],
  templateUrl: './client-list.component.html',
  styleUrl: './client-list.component.css'
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  selectedClientId: string | null = null;

  constructor(private clientService: ClientService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.clientService.getClients()
      .subscribe(response => {
        this.clients = response;
      });
  }

  formatDocument(client: Client): string {
    const doc = client.cpf || client.cnpj || '';
    return doc.length === 11
      ? doc.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
      : doc.length === 14
        ? doc.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
        : doc;
  }


  onEdit(client: any): void {
    console.log('Editar cliente:', client);
    this.router.navigate([`/client-update/${client.id}`]);
  }

  onDelete(client: any): void {
    this.selectedClientId = client.id;
    const modal = new window.bootstrap.Modal(document.getElementById('deleteModal')!);
    modal.show();
  }

  confirmDelete(): void {
    if (!this.selectedClientId) return;

    this.clientService.removeClient(this.selectedClientId).subscribe({
      next: () => {
        this.toastr.success('Registro apagado com sucesso!');
        const modal = window.bootstrap.Modal.getInstance(document.getElementById('deleteModal')!);
        modal.hide();
        this.loadClients();
      },
      error: () => {
        this.toastr.error('Erro ao apagar registro.');
      }
    });
  }
}
