import { DataSource } from 'typeorm';
import { TraditionalDance } from '../traditional-dances/entities/traditional-dance.entity';
import { Province } from '../provinces/entities/province.entity';
import traditionalDancesData from './data/traditional-dances.data';

export const seedTraditionalDances = async (dataSource: DataSource) => {
  const danceRepository = dataSource.getRepository(TraditionalDance);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Traditional Dances...');

  for (const data of traditionalDancesData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for dance ${data.name}. Skipping...`);
      continue;
    }

    const existingDance = await danceRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingDance) {
      const newDance = danceRepository.create({
        name: data.name,
        description: data.description,
        video_url: data.video_url,
        province: province
      });
      await danceRepository.save(newDance);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing dance: ${data.name} in ${province.name}`);
      await danceRepository.update(
        { id: existingDance.id },
        {
          name: data.name,
          description: data.description,
          video_url: data.video_url,
          province: province
        }
      );
    }
  }
};