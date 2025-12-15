import { DataSource } from 'typeorm';
import { TourismSpot } from '../tourism-spots/entities/tourism-spot.entity';
import { Province } from '../provinces/entities/province.entity';
import tourismSpotsData from './data/traditional-spots.data';

export const seedTraditionalSpots = async (dataSource: DataSource) => {
  const spotRepository = dataSource.getRepository(TourismSpot);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Traditional Spots...');

  for (const data of tourismSpotsData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for spot ${data.name}. Skipping...`);
      continue;
    }

    const existingSpot = await spotRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingSpot) {
      const newSpot = spotRepository.create({
        name: data.name,
        location_address: data.location_address,
        maps_coordinate: data.maps_coordinate,
        description: data.description,
        image_url: data.image_url,
        province: province
      });
      await spotRepository.save(newSpot);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing spot: ${data.name} in ${province.name}`);
      await spotRepository.update(
        { id: existingSpot.id },
        {
          name: data.name,
          location_address: data.location_address,
          maps_coordinate: data.maps_coordinate,
          description: data.description,
          image_url: data.image_url,
          province: province
        }
      );
    }
  }
};