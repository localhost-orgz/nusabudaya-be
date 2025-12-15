import { DataSource } from 'typeorm';
import { Culinary } from '../culinaries/entities/culinary.entity';
import { Province } from '../provinces/entities/province.entity';
import culinariesData from './data/culinary.data';

export const seedCulinaries = async (dataSource: DataSource) => {
  const culinaryRepository = dataSource.getRepository(Culinary);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Culinaries...');

  for (const data of culinariesData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for culinary ${data.name}. Skipping...`);
      continue;
    }

    const existingCulinary = await culinaryRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingCulinary) {
      const newCulinary = culinaryRepository.create({
        name: data.name,
        type: data.type,
        description: data.description,
        image_url: data.image_url,
        province: province
      });
      await culinaryRepository.save(newCulinary);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing culinary: ${data.name} in ${province.name}`);
      await culinaryRepository.update(
        { id: existingCulinary.id },
        {
          name: data.name,
          type: data.type,
          description: data.description,
          image_url: data.image_url,
          province: province
        }
      );
    }
  }
};