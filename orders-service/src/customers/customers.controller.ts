import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @MessagePattern('createCustomer')
  create(@Payload() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }

  @MessagePattern('findAllCustomers')
  findAll() {
    return this.customersService.findAll();
  }

  @MessagePattern('findOneCustomer')
  findOne(@Payload() id: number) {
    return this.customersService.findOne(id);
  }

  @MessagePattern('updateCustomer')
  update(@Payload() updateCustomerDto: UpdateCustomerDto) {
    return this.customersService.update(updateCustomerDto.id, updateCustomerDto);
  }

  @MessagePattern('removeCustomer')
  remove(@Payload() id: number) {
    return this.customersService.remove(id);
  }
}
