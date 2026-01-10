import { DataSource } from 'typeorm';
import { Province } from '../provinces/entities/province.entity';
import provincesData from './data/province.data';
import { PROVINCE_LOGOS } from './data/assets/province-logo.data';

export const seedProvinces = async (dataSource: DataSource) => {
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Provinces...');

  for (const data of provincesData) {
    const existingProvince = await provinceRepository.findOneBy({ name: data.name });

    if (!existingProvince) {
      const newProvince = provinceRepository.create(data);
      await provinceRepository.save(newProvince);
      console.log(`✅ Created: ${data.name}`);
    } else {
      console.log(`✏️ Updating existing province: ${data.name}`);
      await provinceRepository.update({ id: existingProvince.id }, data);
    }
  }
};

export const seedProvinceLogos = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(Province);
  
  console.log('Memulai update logo provinsi...');
  
  for (const [name, url] of Object.entries(PROVINCE_LOGOS)) {
    const result = await repository.update(
      { name: name }, 
      { icon_url: url }
    );
    
    if (result.affected === 0) {
      console.warn(`Warning: Provinsi "${name}" tidak ditemukan di database.`);
    }
  }
  
  console.log('Update logo selesai!');
};