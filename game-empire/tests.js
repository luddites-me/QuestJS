"use strict";



QuestJs._test.tests = function() {


  QuestJs._test.title("name");
  const region = new Region('my region', 'red', 7, '4,5 3,7 2,8 2,8 3,8 3,7 5,6')
  QuestJs._test.assertEqual(34, region.count);
  QuestJs._test.assertEqual(7, region.minX);
  QuestJs._test.assertEqual(13, region.maxX);
  QuestJs._test.assertEqual(2, region.minY);
  QuestJs._test.assertEqual(8, region.minY);

  QuestJs._test.assertEqual(true, region.contains(7,4));
  QuestJs._test.assertEqual(true, region.contains(7,5));
  QuestJs._test.assertEqual(true, region.contains(13,5));
  QuestJs._test.assertEqual(true, region.contains(13,6));
  QuestJs._test.assertEqual(false, region.contains(6,4));
  QuestJs._test.assertEqual(false, region.contains(7,3));
  QuestJs._test.assertEqual(false, region.contains(7,6));
  QuestJs._test.assertEqual(false, region.contains(13,4));
  QuestJs._test.assertEqual(false, region.contains(13,7));
  QuestJs._test.assertEqual(false, region.contains(14,5));

  const r1 = new Region('r1', 'blue', 17, '4,5 3,7 2,8 2,8 3,8 3,7 5,6')
  const r2 = new Region('r2', 'blue', 7, '6,9 8,10 11,14 9,12 9,12 8,9 7,9')
  const r3 = new Region('r3', 'blue', 7, '6,9 7,10 11,14 9,12 9,12 8,9 7,9')

  QuestJs._test.assertEqual(true, region.overlaps(r1));
  QuestJs._test.assertEqual(false, region.overlaps(r1));
  QuestJs._test.assertEqual(false, region.overlaps(r1));


};

 
    
    
    
    
    
    
  