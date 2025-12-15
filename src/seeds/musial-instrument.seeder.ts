import { DataSource } from 'typeorm';
import { MusicalInstrument } from '../musical-instruments/entities/musical-instrument.entity';
import { Province } from '../provinces/entities/province.entity';
import musicalInstrumentsData from './data/musical-instrument.data';

export const seedMusicalInstruments = async (dataSource: DataSource) => {
  const instrumentRepository = dataSource.getRepository(MusicalInstrument);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Musical Instruments...');

  for (const data of musicalInstrumentsData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for instrument ${data.name}. Skipping...`);
      continue;
    }

    const existingInstrument = await instrumentRepository.findOne({
      where: {
        name: data.name,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingInstrument) {
      const newInstrument = instrumentRepository.create({
        name: data.name,
        cara_main: data.cara_main,
        image_url: data.image_url,
        province: province
      });
      await instrumentRepository.save(newInstrument);
      console.log(`✅ Created: ${data.name} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing instrument: ${data.name} in ${province.name}`);
      await instrumentRepository.update(
        { id: existingInstrument.id },
        {
          name: data.name,
          cara_main: data.cara_main,
          image_url: data.image_url,
          province: province
        }
      );
    }
  }
};