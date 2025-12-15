import { DataSource } from 'typeorm';
import { Province } from '../provinces/entities/province.entity';
import provincesData from './data/province.data';

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