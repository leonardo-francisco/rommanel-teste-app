import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Router, RouterModule } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { ToastrService } from 'ngx-toastr';
import { Client } from '../../model/client.model';
import moment from 'moment';

@Component({
  selector: 'app-client-add',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './client-add.component.html',
  styleUrl: './client-add.component.css'
})
export class ClientAddComponent implements OnInit {
  clientForm!: FormGroup;
  states: { id: number; sigla: string; nome: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStates();
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      cpfCnpj: ['', [Validators.required]],
      birthDate: ['', Validators.required],
      phone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      address: this.fb.group({
        zipCode: ['', Validators.required],
        street: ['', Validators.required],
        number: ['', Validators.required],
        neighborhood: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
      }),
      ie: [''],
      freeIE: [false]
    });
  }

  loadStates() {
    this.http.get<any[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .subscribe(data => {
        this.states = data.sort((a, b) => a.nome.localeCompare(b.nome));
      });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.toastr.warning('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    const clientData = this.clientForm.value;
    console.log(clientData)
    const doc = clientData.cpfCnpj.replace(/\D/g, '');
    const isCPF = doc.length === 11;
    const isCNPJ = doc.length === 14;

    // Validação específica
    if (isCPF) {
      const age = moment().diff(moment(clientData.birthDate), 'years');
      if (age < 18) {
        this.toastr.error('Clientes com CPF devem ter no mínimo 18 anos.');
        return;
      }
    }

    if (isCNPJ) {
      const ie = clientData.address.ie;
      const freeIE = clientData.address.freeIE;

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
        state: clientData.address.state,
      },
      ie: isCNPJ ? clientData.address.ie : null,
      freeIE: isCNPJ ? clientData.address.freeIE : false
    };

    this.clientService.addClient(payload).subscribe({
      next: () => {
        this.toastr.success('Cliente cadastrado com sucesso!');
        this.clientForm.reset();
        this.router.navigate(['/client-list']);
      },
      error: () => {
        this.toastr.error('Erro ao cadastrar cliente. Tente novamente.');
      }
    });

  }

}
