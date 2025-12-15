import { DataSource } from 'typeorm';
import { Tradition } from '../traditions/entities/tradition.entity';
import { Province } from '../provinces/entities/province.entity';
import traditionsData from './data/tradition.data';

export const seedTraditions = async (dataSource: DataSource) => {
  const traditionRepository = dataSource.getRepository(Tradition);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Traditions...');

  for (const data of traditionsData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for tradition ${data.name}. Skipping...`);
      continue;
    }

    const existingTradition = await traditionRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingTradition) {
      const newTradition = traditionRepository.create({
        name: data.name,
        description: data.description,
        event_date: data.event_date,
        province: province
      });
      await traditionRepository.save(newTradition);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing tradition: ${data.name} in ${province.name}`);
      await traditionRepository.update(
        { id: existingTradition.id },
        {
          name: data.name,
          description: data.description,
          event_date: data.event_date,
          province: province
        }
      );
    }
  }
};