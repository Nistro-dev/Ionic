<?php

namespace App\Repository;

use App\Entity\EstablishmentReview;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EstablishmentReview>
 */
class EstablishmentReviewRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EstablishmentReview::class);
    }

    /**
     * @return EstablishmentReview[] Returns an array of EstablishmentReview objects
     */
    public function findByEstablishment(int $establishmentId): array
    {
        return $this->createQueryBuilder('er')
            ->andWhere('er.establishment = :establishmentId')
            ->setParameter('establishmentId', $establishmentId)
            ->orderBy('er.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}