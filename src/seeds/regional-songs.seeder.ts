import { DataSource } from 'typeorm';
import { RegionalSong } from '../regional-songs/entities/regional-song.entity';
import { Province } from '../provinces/entities/province.entity';
import regionalSongsData from './data/regional-song.data';

export const seedRegionalSongs = async (dataSource: DataSource) => {
  const songRepository = dataSource.getRepository(RegionalSong);
  const provinceRepository = dataSource.getRepository(Province);

  console.log('Seeding Regional Songs...');

  for (const data of regionalSongsData) {
    const province = await provinceRepository.findOneBy({ name: data.province_name });
    if (!province) {
      console.warn(`Province not found: ${data.province_name} for song "${data.title}". Skipping...`);
      continue;
    }

    const existingSong = await songRepository.findOne({
      where: {
        title: data.title,
        province: { id: province.id }
      },
      relations: ['province']
    });

    if (!existingSong) {
      const newSong = songRepository.create({
        title: data.title,
        lyrics: data.lyrics,
        audio_url: data.audio_url,
        province: province
      });
      await songRepository.save(newSong);
      console.log(`✅ Created: ${data.title} in ${province.name}`);
    } else {
      console.log(`✏️ Updating existing song: ${data.title} in ${province.name}`);
      await songRepository.update(
        { id: existingSong.id },
        {
          title: data.title,
          lyrics: data.lyrics,
          audio_url: data.audio_url,
          province: province
        }
      );
    }
  }
};