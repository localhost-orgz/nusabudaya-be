import { DataSource } from 'typeorm';
import { TraditionalWeapon } from '../traditional-weapons/entities/traditional-weapon.entity';
import { Province } from '../provinces/entities/province.entity';
import traditionalWeaponsData from './data/traditional-weapons.data';

export const seedTraditionalWeapons = async (dataSource: DataSource) => {
  const weaponRepository = dataSource.getRepository(TraditionalWeapon);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Traditional Weapons...');

  for (const data of traditionalWeaponsData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for weapon ${data.name}. Skipping...`);
      continue;
    }

    const existingWeapon = await weaponRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingWeapon) {
      const newWeapon = weaponRepository.create({
        name: data.name,
        description: data.description,
        image_url: data.image_url,
        province: province
      });
      await weaponRepository.save(newWeapon);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing weapon: ${data.name} in ${province.name}`);
      await weaponRepository.update(
        { id: existingWeapon.id },
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