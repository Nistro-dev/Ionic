<?php

namespace App\Controller;

use App\Entity\Place;
use App\Form\PlaceType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class PlaceController extends AbstractController
{
    #[Route('/places', name: 'places')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function index(EntityManagerInterface $em): Response
    {
        $places = $em->getRepository(Place::class)->findBy(['statut' => 'Validé']);
        return $this->render('place/index.html.twig', [
            'places' => $places,
        ]);
    }

    #[Route('/places/add', name: 'place_add')]
    #[IsGranted('IS_AUTHENTICATED_FULLY')]
    public function add(Request $request, EntityManagerInterface $em): Response
    {
        $place = new Place();
        $form = $this->createForm(PlaceType::class, $place);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $place->setStatut('En attente');
            $place->setUser($this->getUser());
            $place->setCreateAt(new \DateTimeImmutable());

            $em->persist($place);
            $em->flush();

            $this->addFlash('success', 'Établissement proposé avec succès. Il sera visible après validation.');
            return $this->redirectToRoute('places');
        }

        return $this->render('place/add.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}