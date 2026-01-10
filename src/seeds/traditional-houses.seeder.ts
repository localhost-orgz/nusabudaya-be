import { DataSource } from 'typeorm';
import { TraditionalHouse } from '../traditional-houses/entities/traditional-house.entity';
import { Province } from '../provinces/entities/province.entity';
import traditionalHousesData from './data/traditional-houses.data';
import { HOUSE_IMAGES } from './data/assets/house-image.data';

export const seedTraditionalHouses = async (dataSource: DataSource) => {
  const houseRepository = dataSource.getRepository(TraditionalHouse);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Traditional Houses...');

  for (const data of traditionalHousesData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for house ${data.name}. Skipping...`);
      continue;
    }

    const existingHouse = await houseRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingHouse) {
      const newHouse = houseRepository.create({
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        province: province
      });
      await houseRepository.save(newHouse);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing house: ${data.name} in ${province.name}`);
      await houseRepository.update(
        { id: existingHouse.id },
        {
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          province: province
        }
      );
    }
  }
};

export const seedTraditionalHouseImages = async (dataSource: DataSource) => {
  const repository = dataSource.getRepository(TraditionalHouse);
  
  console.log('Memulai update gambar rumah adat...');
  
  for (const [houseName, url] of Object.entries(HOUSE_IMAGES)) {
    const result = await repository.update(
      { name: houseName }, 
      { image_url: url }
    );
    
    if (result.affected === 0) {
      console.warn(`Warning: Rumah Adat "${houseName}" tidak ditemukan di database.`);
    }
  }
  
  console.log('Update gambar rumah adat selesai!');
};