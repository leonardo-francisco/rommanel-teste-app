import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClientService } from '../../service/client.service';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { Client } from '../../model/client.model';
import moment from 'moment';

@Component({
  selector: 'app-client-update',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './client-update.component.html',
  styleUrl: './client-update.component.css'
})
export class ClientUpdateComponent implements OnInit {
  clientForm!: FormGroup;
  states: { id: number; sigla: string; nome: string }[] = [];
  id!: string;

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadStates();
    const id = this.route.snapshot.paramMap.get('id');
  if (id) {
    this.id = id;
    this.getClient(id);
  }
  }

  loadStates() {
    this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .subscribe(data => {
        this.states = data.sort((a, b) => a.nome.localeCompare(b.nome));
      });
  }

  getClient(id: string){
    this.clientService.getById(id).subscribe({
      next: (data) => {
        this.clientForm = this.fb.group({
          name: [data.name, Validators.required],
          cpfCnpj: [{ value: data.cpf && data.cpf.trim() !== '' ? data.cpf : data.cnpj, disabled: true }, Validators.required],
          birthDate: [data.birthDate ? data.birthDate.split('T')[0] : '', Validators.required],
          phone: [data.phone, Validators.required],
          email: [{ value: data.email || '', disabled: true }, [Validators.required, Validators.email]],
          address: this.fb.group({
            zipCode: [data.address.zipCode, Validators.required],
            street: [data.address.street, Validators.required],
            number: [data.address.number, Validators.required],
            neighborhood: [data.address.neighborhood, Validators.required],
            city: [data.address.city, Validators.required],
            state: [data.address.state, Validators.required]
          }),
          ie: [data.ie || ''],
          freeIE: [data.freeIE || false]
        });
        console.log('Form carregado:', this.clientForm.value);
      },
      error: () => {
        this.toastr.error('Erro ao carregar cliente.');

      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.toastr.warning('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const clientData = this.clientForm.value;
    const rawDoc = clientData.cpfCnpj || '';
    const doc = rawDoc.replace(/\D/g, '');
    const isCPF = doc.length === 11;
    const isCNPJ = doc.length === 14;

    // Validação extra para CPF (idade mínima)
    if (isCPF) {
      const age = moment().diff(moment(clientData.birthDate), 'years');
      if (age < 18) {
        this.toastr.error('Clientes com CPF devem ter no mínimo 18 anos.');
        return;
      }
    }

    // Validação extra para IE se for CNPJ
    if (isCNPJ) {
      const ie = clientData.ie;
      const freeIE = clientData.freeIE;

      if (!freeIE && (!ie || ie.trim() === '')) {
        this.toastr.error('Informe a Inscrição Estadual ou marque como isento.');
        return;
      }
    }

    const payload: Client = {
      name: clientData.name,
      cpf: isCPF ? doc : null,
      cnpj: isCNPJ ? doc : null,
      birthDate: clientData.birthDate,
      phone: clientData.phone,
      email: clientData.email,
      address: {
        zipCode: clientData.address.zipCode,
        street: clientData.address.street,
        number: clientData.address.number,
        neighborhood: clientData.address.neighborhood,
        city: clientData.address.city,
        state: clientData.address.state
      },
      ie: isCNPJ ? clientData.ie : null,
      freeIE: isCNPJ ? clientData.freeIE : false
    };

    this.clientService.updateClient(this.id, payload).subscribe({
      next: () => {
        this.toastr.success('Cliente atualizado com sucesso!');
        this.router.navigate(['/client-list']);
      },
      error: () => {
        this.toastr.error('Erro ao atualizar cliente. Tente novamente.');
      }
    });
  }

}
